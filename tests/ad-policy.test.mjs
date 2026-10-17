import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AD_INTERVAL_MS,claimAd,isAdDue} from '../src/lib/ad-policy.mjs';
function storage(){const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};}
test('a new visitor gets a full 50 minute grace period, including reloads',()=>{const s=storage(),now=100000;assert.equal(claimAd(s,now),false);assert.equal(claimAd(s,now+AD_INTERVAL_MS-1),false);assert.equal(claimAd(s,now+AD_INTERVAL_MS),true);});
test('a claimed request suppresses the next tab and waits another 50 minutes',()=>{const s=storage();claimAd(s,1000);assert.equal(claimAd(s,1000+AD_INTERVAL_MS),true);assert.equal(claimAd(s,1000+AD_INTERVAL_MS),false);assert.equal(claimAd(s,1000+AD_INTERVAL_MS*2-1),false);assert.equal(claimAd(s,1000+AD_INTERVAL_MS*2),true);});
test('clock rollback, invalid data and unavailable storage fail closed',()=>{assert.equal(isAdDue(5000,null,4000),false);assert.equal(isAdDue(NaN,null,9999999),false);assert.equal(claimAd({getItem(){throw Error('blocked');}},9999999),false);assert.equal(claimAd({getItem:()=>'{broken'},9999999),false);});
