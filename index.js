const a0_0x493d37=a0_0xf3b1;(function(_0x988f7e,_0x25ea3f){const _0x300868=a0_0xf3b1,_0x116db1=_0x988f7e();while(!![]){try{const _0x402e9d=parseInt(_0x300868(0x13d))/0x1+-parseInt(_0x300868(0x12b))/0x2*(parseInt(_0x300868(0x142))/0x3)+parseInt(_0x300868(0x11e))/0x4+-parseInt(_0x300868(0x12c))/0x5*(-parseInt(_0x300868(0x138))/0x6)+parseInt(_0x300868(0x137))/0x7*(parseInt(_0x300868(0x132))/0x8)+parseInt(_0x300868(0x13b))/0x9+-parseInt(_0x300868(0x130))/0xa;if(_0x402e9d===_0x25ea3f)break;else _0x116db1['push'](_0x116db1['shift']());}catch(_0x126c1f){_0x116db1['push'](_0x116db1['shift']());}}}(a0_0x583f,0x2eef2),require('dotenv')[a0_0x493d37(0x146)]());function a0_0x583f(){const _0x25fd49=['1.\x20Transfer\x20ETH','3.\x20Deploy\x20Smart\x20Contract','stdin','chalk','2.\x20Interact\x20with\x20WETH','superseed-testnet','338CCvCUg','25MlVquR','green','catch','readFileSync','10034470kLMIkz','log','20152MhhGQK','./utils/name.js','\x0aChoose\x20the\x20script\x20to\x20run:\x20','Exiting\x20program.\x20Goodbye!','blueBright','847EZyXwx','237054ooVLuD','./config/network.json','utf-8','2878713AMdePs','question','362278KJoZry','exit','Enter\x20password:\x20','./src/deploySC','Incorrect\x20password.\x20Access\x20denied.','4185QEifuA','yellow','error','readline','config','987860BrCShi','parse','./src/transfer','Invalid\x20choice.\x20Please\x20restart\x20and\x20choose\x201,\x202,\x203,\x20or\x204.','Available\x20Scripts:','red','close'];a0_0x583f=function(){return _0x25fd49;};return a0_0x583f();}const fs=require('fs'),readline=require(a0_0x493d37(0x145)),readlineSync=require('readline-sync'),chalk=require(a0_0x493d37(0x128)),{printName}=require(a0_0x493d37(0x133)),networkConfig=JSON[a0_0x493d37(0x11f)](fs[a0_0x493d37(0x12f)](a0_0x493d37(0x139),a0_0x493d37(0x13a))),selectedNetwork=networkConfig['Superseed\x20Testnet'],{RPC_URL:RPC_URL,CHAIN_ID:CHAIN_ID,WETH_ADDRESS:WETH_ADDRESS}=selectedNetwork;function promptUser(_0x23e65d){return new Promise(_0x2111ee=>{const _0xa5df7c=a0_0xf3b1,_0x5ccbe3=readline['createInterface']({'input':process[_0xa5df7c(0x127)],'output':process['stdout']});_0x5ccbe3[_0xa5df7c(0x13c)](chalk[_0xa5df7c(0x136)](_0x23e65d),_0x1da3aa=>{const _0x1fa9ea=_0xa5df7c;_0x5ccbe3[_0x1fa9ea(0x124)](),_0x2111ee(_0x1da3aa);});});}function inputPassword(){const _0xc15bfe=a0_0x493d37,_0x2ee246=_0xc15bfe(0x12a),_0x43a561=readlineSync[_0xc15bfe(0x13c)](_0xc15bfe(0x13f),{'hideEchoBack':!![],'mask':''});_0x43a561!==_0x2ee246&&(console[_0xc15bfe(0x144)](_0xc15bfe(0x141)),process[_0xc15bfe(0x13e)](0x1));}function a0_0xf3b1(_0x2b4e5b,_0x3020b0){const _0x583f0c=a0_0x583f();return a0_0xf3b1=function(_0xf3b1c1,_0x19d3fc){_0xf3b1c1=_0xf3b1c1-0x11e;let _0x59bb12=_0x583f0c[_0xf3b1c1];return _0x59bb12;},a0_0xf3b1(_0x2b4e5b,_0x3020b0);}async function main(){const _0x18a700=a0_0x493d37;inputPassword(),printName(),console[_0x18a700(0x131)](chalk[_0x18a700(0x143)](_0x18a700(0x122))),console['log'](_0x18a700(0x125)),console['log'](_0x18a700(0x129)),console[_0x18a700(0x131)](_0x18a700(0x126)),console['log']('4.\x20Bridge\x20ETH'),console[_0x18a700(0x131)]('0.\x20Exit\x20Program');const _0x528863=await promptUser(_0x18a700(0x134));if(_0x528863==='1'){const _0xf2ccff=require(_0x18a700(0x120));_0xf2ccff(RPC_URL,CHAIN_ID);}else{if(_0x528863==='2'){const _0x4d2d5d=require('./src/interaction');_0x4d2d5d(RPC_URL,CHAIN_ID,WETH_ADDRESS);}else{if(_0x528863==='3'){const _0x429ef4=require(_0x18a700(0x140));_0x429ef4(RPC_URL,CHAIN_ID);}else{if(_0x528863==='4'){const _0x305761=require('./src/bridge');_0x305761(RPC_URL,CHAIN_ID);}else _0x528863==='0'?(console[_0x18a700(0x131)](chalk[_0x18a700(0x12d)](_0x18a700(0x135))),process[_0x18a700(0x13e)](0x0)):console[_0x18a700(0x131)](chalk[_0x18a700(0x123)](_0x18a700(0x121)));}}}}main()[a0_0x493d37(0x12e)](console['error']);