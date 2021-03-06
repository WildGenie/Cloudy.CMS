﻿import List from './ListSupport/list.js';

class Nav {
    constructor(portal) {
        this.portal = portal;
        this.element = document.createElement('poetry-ui-portal-nav');
        document.body.append(this.element);
        this.toggle = document.createElement('poetry-ui-portal-nav-toggle');
        this.element.appendChild(this.toggle);

        this.toggle.tabIndex = 0;
        var hideToggle = () => {
            if (!this.toggle.classList.contains('poetry-ui-active')) {
                return;
            }

            this.toggle.classList.remove('poetry-ui-active');
            this.menu.classList.add('poetry-ui-hidden');
            this.menuFade.classList.add('poetry-ui-hidden');
        };
        this.toggle.addEventListener('click', () => {
            if (!this.toggle.classList.contains('poetry-ui-active')) {
                this.toggle.classList.add('poetry-ui-active');
                this.menu.classList.remove('poetry-ui-hidden');
                this.menuFade.classList.remove('poetry-ui-hidden');
            } else {
                hideToggle();
            }
        });
        this.toggle.addEventListener("keyup", event => {
            if (event.keyCode != 13) {
                return;
            }

            event.preventDefault();
            this.toggle.click();
        });
        document.documentElement.addEventListener('click', event => {
            if (!event.target.matches('poetry-ui-portal-nav, poetry-ui-portal-nav-toggle')) {
                hideToggle();
            }
        });

        this.menu = document.createElement('poetry-ui-portal-nav-menu');
        this.menu.classList.add('poetry-ui-hidden');
        this.element.appendChild(this.menu);

        this.menuList = new List();
        this.menuList.appendTo(this.menu);

        this.menuFade = document.createElement('poetry-ui-portal-nav-menu-fade');
        this.menuFade.classList.add('poetry-ui-hidden');
        this.element.appendChild(this.menuFade);

        this.appDescriptorsPromise = fetch('App/GetAll', { credentials: 'include' }).then(response => response.json());
        this.appDescriptorsPromise.then(appDescriptors => {
            this.menuList.addSubHeader('Apps');
            appDescriptors.forEach(appDescriptor => {
                this.menuList.addItem(item => {
                    item.setText(appDescriptor.name);
                    item.element.setAttribute('poetry-ui-app-id', appDescriptor.id);
                    item.onClick(() => portal.openApp(appDescriptor));
                });
            });
            if (appDescriptors.length == 1) {
                portal.openApp(appDescriptors[0]);
            }
        });

        if (document.readyState != 'loading') {
            this.openStartApp();
        } else {
            document.addEventListener('DOMContentLoaded', this.openStartApp);
        }
    }

    openStartApp() {
        if (!location.hash) {
            return;
        }

        var match = location.hash.substr(1).match(/^[a-z0-9-_.]+/i);

        if (match) {
            var appId = match[0];

            this.appDescriptorsPromise.then(appDescriptors => {
                var appDescriptor = appDescriptors.find(a => a.id == appId);

                if (!appDescriptor) {
                    throw `App not found: ${appId}`;
                }

                this.portal.openApp(appDescriptor);
            });
        }
    }

    openApp(appDescriptor) {
        this.appDescriptorsPromise.then(() => {
            [...this.menuList.element.querySelectorAll('poetry-ui-portal-nav-item')].forEach(c => c.classList.remove('poetry-ui-active'));
            this.menuList.element.querySelector(`[poetry-ui-app-id="${appDescriptor.id}"]`).classList.add('poetry-ui-active');
        });
    }

    setTitle(value) {
        var title = document.createElement('poetry-ui-portal-nav-title');
        title.innerText = value;
        this.element.append(title);
    }
}

export default Nav;