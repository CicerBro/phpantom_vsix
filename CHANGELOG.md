# Changelog

## 0.2.0

- Added background checks for newer PHPantom language server releases when using `phpantom.releaseTag = "latest"`.
- Added automatic restart after a newer downloaded server is cached.
- Added `phpantom.autoUpdate` and `phpantom.updateCheckIntervalHours` settings.

## 0.1.0

- Added a dedicated VS Code/Cursor extension for PHPantom.
- Added automatic `phpantom_lsp` discovery via `phpantom.serverPath`, PATH, local cache, and GitHub Releases download.
- Added commands for restart, output, forced download, and clearing cached binaries.
