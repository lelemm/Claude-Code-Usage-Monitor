use std::os::windows::process::CommandExt;
use std::process::Command;

pub fn set(provider: &str) -> Result<(), String> {
    let output = Command::new("wsl.exe")
        .args([
            "--exec",
            "bash",
            "-lc",
            "node -e \"$1\" \"$2\"",
            "9router",
            include_str!("9router_priority.js"),
            provider,
        ])
        .creation_flags(0x0800_0000)
        .output()
        .map_err(|error| error.to_string())?;
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}
