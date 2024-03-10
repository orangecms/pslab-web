mod utils;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
// use wasm_bindgen_futures::spawn_local;
use wasm_bindgen_futures::JsFuture as Future;
use web_sys::{window, SerialOptions, SerialPort};

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

// We use a callback to continuously pass back data; see also
// https://rustwasm.github.io/wasm-bindgen/reference/receiving-js-closures-in-rust.html
#[wasm_bindgen]
pub async fn request_port(cb: &js_sys::Function) -> Result<(), JsValue> {
    let w = window().unwrap();
    let n = w.navigator();
    let s = n.serial();
    let p = s.request_port();
    // https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.SerialPort.html
    // https://rustwasm.github.io/wasm-bindgen/reference/js-promises-and-rust-futures.html
    let port: SerialPort = Future::from(p).await.unwrap().into();
    let opts = SerialOptions::new(115200);
    log("[rust::wasm] open port");

    let _ = Future::from(port.open(&opts)).await;
    log("[rust::wasm] get readable");
    let pr = port.readable();
    // The port ReadableStream currently only gets "object"
    // https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.ReadableStream.html#method.get_reader
    // so we use wasm_streams instead
    // https://docs.rs/wasm-streams/latest/wasm_streams/readable/struct.ReadableStreamDefaultReader.html
    log("[rust::wasm] get readable stream");
    let mut rs = wasm_streams::readable::ReadableStream::from_raw(pr);
    log("[rust::wasm] get reader");
    let mut r = &mut rs.get_reader();
    log("[rust::wasm] read...");
    // https://doc.rust-lang.org/rust-by-example/flow_control/while_let.html
    while let Ok(Some(res)) = r.read().await {
        // https://docs.rs/serde-wasm-bindgen/latest/serde_wasm_bindgen/
        let r: Vec<u8> = serde_wasm_bindgen::from_value(res.clone())?;
        if r.len() >= 1 {
            let c = r[0] as char;
            log(&format!("{c}"));
            let this = JsValue::null();
            let _ = cb.call1(&this, &res);
        }
    }

    // spawn_local(async move { });
    log("that's it...");
    Ok(())
}
