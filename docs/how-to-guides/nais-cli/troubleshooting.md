# Troubleshooting

## `Could not create process with command`

If you get an error message like this (the path may vary):
```
> nais
Could not create process with command '"C:\Users\<YOU>\scoop\apps\nais-cli\current\nais.exe" '.
```
which is the shim hiding the actual error message:
```
> C:\Users\<YOU>\scoop\apps\nais-cli\current\nais.exe
ResourceUnavailable: Program 'nais.exe' failed to run: An error occurred trying to start process 'C:\Users\<YOU>\scoop\apps\nais-cli\current\nais.exe' with working directory '<SOMEWHERE>'. Access is denied.At line:1 char:1
+ C:\Users\<YOU>\scoop\apps\nais-cli\current\nais.exe
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.
```
then you need to exclude the folder `%USERPROFILE%\scoop\apps\nais-cli` from Windows Security:

1. Open Windows Security.
2. Select Virus & threat protection.
3. Select Manage settings, and then under Exclusions, select Add or remove exclusions.
4. Select Add an exclusion, and then select folder.
5. Add the folder `%USERPROFILE%\scoop\apps\nais-cli`.

Alternatively, from an elevated PowerShell:
```
> Add-MpPreference -ExclusionPath %USERPROFILE%\scoop\apps\nais-cli
```