'use client'

import { useState } from "react";

const PSLab = () => {
  const [log, setLog] = useState("");
  const [port, setPort] = useState(null);

  const xlog = (v) => {
    v.forEach((b) => {
      const c = vtoc(b);
      setLog(l => `${l}${c}`);
    });
  }

  const wreq = async () => {
    const { request_port: reqPort } = await import("../pslab-wasm/pkg");
    reqPort(xlog);
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

  const vroom = async () => {
    if (!port) {
      return;
    }
    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode("VROOM\n"));
    writer.releaseLock();
  };

  const boom = async () => {
    const { boom: boomboom } = await import("../pslab-wasm/pkg");
    const logx = (v) => xlog([(v[1] << 8) | v[0]]);
    boomboom(logx);
  }

  const clear = () => {
    setLog("");
  };

  const reqSer = async () => {
    try {
      const p = await navigator.serial.requestPort();
      console.info(p);
      await p.open({ baudRate: 115200 });
      setPort(p);
    } catch (e) {
      console.error(e);
    }
  };

  const btnStyle = { width: 200, height: 40, fontSize: 18 };
  const boxStyle = { width: 860, height: 360, fontSize: 12, margin: "10px 0", padding: "3px 0", border: "2px solid #f30808", background: "#090202" };
  const preStyle = { width: "100%", height: 320, fontSize: 16, overflowY: "auto", padding: 2, background: "#101010", scrollSnapType: "y proximity", scrollPaddingTop: 40, display: "flex", flexDirection: "column-reverse" };

  return (
    <div>
      <div style={{ display: "flex", gap: 20 }}>
        <button style={btnStyle} onClick={wreq}>select port Wasm</button>
        <button style={btnStyle} onClick={reqSer}>select port JS</button>
        <button style={btnStyle} onClick={vroom}>vroom vroom</button>
        <button style={btnStyle} onClick={boom}>boom boom</button>
      </div>
      <div style={boxStyle}>
        <h4 style={{ padding: "0 4px" }}>output</h4>
        <pre style={preStyle}>{log}✍</pre>
        <span style={{ padding: "0 4px" }}>Log size: {log.length}</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <button style={btnStyle} onClick={clear}>clear</button>
        <button style={btnStyle} onClick={listPorts}>list ports</button>
      </div>
    </div>
  );
};

export default PSLab;
