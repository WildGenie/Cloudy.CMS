$ErrorActionPreference = "Stop";

echo $version

dotnet sln remove Website.AspNet
dotnet sln remove Website.AspNetCore
Remove-Item Website.* -r

$command = "dotnet build /p:Version=$version"
Write-Host $command -ForegroundColor Yellow
Invoke-Expression $command

foreach($project_file in Get-ChildItem -File -Filter *.csproj -Recurse -Depth 2 -Exclude Website.*,Tests.*,Cloudy.CMS.MongoDB.Integrations.JsonDotNet) {
	$command = "dotnet pack --no-build ""$($project_file.FullName)"" --output "".."" /p:PackageVersion=$version"
	Write-Host $command -ForegroundColor Yellow
	Invoke-Expression $command
}