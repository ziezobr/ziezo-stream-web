import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isTVDevice,prefersTV} from '../src/lib/tv-device.mjs';
test('recognizes television engines without treating desktop and phones as TVs',()=>{
 for(const ua of ['Mozilla/5.0 (Web0S; Linux/SmartTV) Chrome/94','Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0)','Mozilla/5.0 (Linux; Android 9; AFTMM)','Large Screen WebAppManager','HbbTV/1.2.1'])assert.equal(isTVDevice(ua),true,ua);
 for(const ua of ['Mozilla/5.0 (Windows NT 10.0) Chrome/132','Mozilla/5.0 (iPhone) Safari','Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/132'])assert.equal(isTVDevice(ua),false,ua);
});
test('explicit choice overrides detection and URL overrides remembered choice',()=>{
 assert.equal(prefersTV('Web0S','','off'),false);
 assert.equal(prefersTV('Windows','?tv=on','off'),true);
 assert.equal(prefersTV('Web0S','?tv=off','on'),false);
 assert.equal(prefersTV('Web0S'),true);
});
