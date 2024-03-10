'use client'

import { useState } from "react";

const PSLab = () => {
  const [log, setLog] = useState("");

  const wreq = async () => {
    const { request_port: reqPort } = await import("../pslab-wasm/pkg");
    reqPort();
  };

  const listPorts = async () => {
    let ports = await navigator.serial.getPorts();
    console.info(ports);
  }

  const vtoc = (v) => {
    switch (v) {
      case 13:
        return "\n";
      default:
        return String.fromCharCode(v);
    }
  }

  const reqSer = async () => {
    console.info("xxxxxx");
    try {
      const p = await navigator.serial.requestPort();
      console.info(p);
      await p.open({ baudRate: 115200 });
      while (p.readable) {
        const reader = p.readable.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            const c = vtoc(value);
            setLog(l => `${l}${c}`);
            if (done) {
              // |reader| has been canceled.
              break;
            }
            // Do something with |value|...
          }
        } catch (error) {
        // Handle |error|...
        } finally {
          reader.releaseLock();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const btnStyle = { width: 200, height: 40, fontSize: 18 };

  return (
    <div>
      <div style={{ display: "flex", gap: 20 }}>
        <button style={btnStyle} onClick={reqSer}>select port JS</button>
        <button style={btnStyle} onClick={listPorts}>list ports</button>
        <button style={btnStyle} onClick={wreq}>select port Wasm</button>
      </div>
      <pre>{log}</pre>
    </div>
  );
};

export default PSLab;
