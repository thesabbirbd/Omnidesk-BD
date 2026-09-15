#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .runtime(tauri_runtime_wry::Wry::default())
        .setup(|app| {
            use tauri_plugin_shell::ShellExt;
            let sidecar_command = app.shell().sidecar("backend").expect("failed to create `backend` binary command");
            let (_receiver, _child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
            
            // NOTE: The child process will be automatically killed by Tauri when the app exits.

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
