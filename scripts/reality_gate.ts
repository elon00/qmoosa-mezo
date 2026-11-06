/**
 * Reality scoreboard: independent evidence is mandatory; source presence is NOT proof.
 * Internal readiness differs from the Mezo judges' score.
 */
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {createPublicClient,http} from "viem";
import {MEZO_TESTNET_CONFIG, ERC20_ABI} from "../src/defi/vault.js";

export type GateStatus = "PASS" | "FAIL" | "BLOCKED" | "NOT_RUN";
type Category = "Mezo"|"Business"|"Technical"|"UX"|"Submission";
export interface RealityGateResult {
  gateId:string; name:string; category:Category; allocatedPoints:number; awardedPoints:number;
  status:GateStatus; mandatory:boolean; executed:boolean; correctResult:boolean;
  authenticEvidence:boolean; independentCheck:boolean; evidenceSource:string; evidenceHash:string; details:string;
}
export interface RealityScorecard {
 target:string; timestamp:string; totalScore:number; maxScore:number; releaseEligible:boolean;
 mainnetStatus:"LOCKED"; gateResults:RealityGateResult[];
 categoryBreakdown:{mezoIntegration:{score:number;max:number};businessViability:{score:number;max:number};
 technicalImplementation:{score:number;max:number};userExperience:{score:number;max:number};
 submissionMaterials:{score:number;max:number}};
}
const spec:[string,string,Category,number][]=[
 ["GATE-01","Live Mezo RPC and chain ID","Mezo",8],
 ["GATE-02","Canonical MUSD contract bytecode and decimals","Mezo",8],
 ["GATE-03","Real x402 settlement and session correlation","Mezo",10],
 ["GATE-04","Replay and nonce negative-path validation","Mezo",4],
 ["GATE-05","Real paid marketplace service delivery","Business",10],
 ["GATE-06","Validated merchant economics / user demand","Business",10],
 ["GATE-07","DeFi composability verified on chain","Business",10],
 ["GATE-08","Independent deterministic Conway evaluation","Technical",5],
 ["GATE-09","Actual NIST FIPS 204 ML-DSA verified","Technical",5],
 ["GATE-10","Agent spending controls independently tested","Technical",5],
 ["GATE-11","REA / Raven actual runtime and RSI experiments","Technical",5],
 ["GATE-12","Real wallet and QR purchasing journey","UX",10],
 ["GATE-13","Live deployment, video, deck, submission verified","Submission",10]
];
const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
export async function evaluateRealityGates():Promise<RealityScorecard>{
 const results:RealityGateResult[]=spec.map(([gateId,name,category,allocatedPoints])=>({
  gateId,name,category,allocatedPoints,awardedPoints:0,status:"BLOCKED",mandatory:true,
  executed:false,correctResult:false,authenticEvidence:false,independentCheck:false,
  evidenceSource:"",evidenceHash:"",details:"Independent evidence not supplied"
 }));
 const client=createPublicClient({transport:http(MEZO_TESTNET_CONFIG.rpcUrl,{timeout:9000})});
 try{
  const [chainId,blockNumber]=await Promise.all([client.getChainId(),client.getBlockNumber()]);
  if(chainId!==31611 || blockNumber===0n)throw Error("Wrong chain or no blocks");
  Object.assign(results[0],{status:"PASS",awardedPoints:8,executed:true,correctResult:true,
   authenticEvidence:true,independentCheck:true,evidenceSource:MEZO_TESTNET_CONFIG.rpcUrl,
   evidenceHash:hash(String(chainId)+":"+String(blockNumber)),
   details:"Read-only live network verification. Does not prove settlement."});
 }catch(e){results[0].status="BLOCKED";results[0].details=String(e);}
 try{
  const [chainId,code,decimals,symbol]=await Promise.all([
   client.getChainId(),client.getCode({address:MEZO_TESTNET_CONFIG.musdAddress}),
   client.readContract({address:MEZO_TESTNET_CONFIG.musdAddress,abi:ERC20_ABI,functionName:"decimals"}),
   client.readContract({address:MEZO_TESTNET_CONFIG.musdAddress,abi:ERC20_ABI,functionName:"symbol"})
  ]);
  if(chainId!==31611||!code||code==="0x"||decimals!==18||symbol!=="MUSD")throw Error("Canonical asset mismatch");
  Object.assign(results[1],{status:"PASS",awardedPoints:8,executed:true,correctResult:true,
   authenticEvidence:true,independentCheck:true,evidenceSource:MEZO_TESTNET_CONFIG.musdAddress,
   evidenceHash:hash(code),details:"Real code and token metadata observed; not a payment receipt."});
 }catch(e){results[1].status="BLOCKED";results[1].details=String(e);}
 // Deliberately do NOT import self-attested files to award the remaining points.
 // A separate verifier must prove each end-to-end criterion on real infrastructure.
 const category=(c:Category)=>results.filter(g=>g.category===c).reduce((s,g)=>s+g.awardedPoints,0);
 const out:RealityScorecard={
  target:"100/100 internal readiness (not Mezo judging)",timestamp:new Date().toISOString(),
  totalScore:results.reduce((s,g)=>s+g.awardedPoints,0),maxScore:100,
  releaseEligible:results.every(g=>g.status==="PASS"),mainnetStatus:"LOCKED",gateResults:results,
  categoryBreakdown:{mezoIntegration:{score:category("Mezo"),max:30},
   businessViability:{score:category("Business"),max:30},
   technicalImplementation:{score:category("Technical"),max:20},
   userExperience:{score:category("UX"),max:10},
   submissionMaterials:{score:category("Submission"),max:10}}
 };
 fs.mkdirSync("reports",{recursive:true});
 fs.writeFileSync(path.join("reports","READINESS_REPORT.json"),JSON.stringify(out,null,2)+"\n");
 console.log("Evidence-backed score:",out.totalScore,"/ 100; mainnet",out.mainnetStatus);
 for(const g of results)console.log(g.gateId,g.status,g.details);
 return out;
}
if(process.argv[1]?.endsWith("reality_gate.ts"))evaluateRealityGates().then(r=>{
 if(!r.releaseEligible)process.exitCode=1;
}).catch(e=>{console.error(e);process.exitCode=1;});
