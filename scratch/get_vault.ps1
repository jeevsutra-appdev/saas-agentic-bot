$vault = New-Object Windows.Security.Credentials.PasswordVault
$creds = $vault.RetrieveAll()
foreach ($c in $creds) {
    if ($c.Resource -like "*github*" -or $c.Resource -like "*git:*") {
        try {
            $c.RetrievePassword()
            Write-Output "Resource: $($c.Resource)"
            Write-Output "User: $($c.UserName)"
            Write-Output "Password: $($c.Password)"
            Write-Output "----------------"
        } catch {
            Write-Output "Failed to retrieve for $($c.Resource)"
        }
    }
}
