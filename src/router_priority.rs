use std::os::windows::process::CommandExt;
use std::process::Command;

pub fn set(provider: &str) -> Result<(), String> {
    run(provider).map(|_| ())
}

pub fn get() -> Result<String, String> {
    let provider = run("get")?;
    match provider.as_str() {
        "codex" | "claude" => Ok(provider),
        _ => Err("9router returned an unknown provider".into()),
    }
}

fn run(provider: &str) -> Result<String, String> {
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
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}
