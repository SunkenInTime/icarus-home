$log = "E:\Projects\icarus-home\.assets-gen\codex.log"
& node "C:\Users\shawn\.claude\skills\codex\scripts\codex-run.mjs" `
  --write --cd "E:\Projects\icarus-home" --timeout 2400 `
  --prompt-file "E:\Projects\icarus-home\.assets-gen\prompt.txt" *> $log
"EXITCODE=$LASTEXITCODE" | Out-File -Append -Encoding utf8 $log
