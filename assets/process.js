const fs = require('fs');
const readline = require('readline');
const path = require('path');
const filePath = path.join(__dirname, './aa.m3u8');
let rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
});

let prefix = 'https://ltsbsy.qq.com/uwMROfz0r5zA4aQXGdGnC2df646CEuO65p4cikEfBHaPRsW7/TWQHd2GVv93rJkFXeufHx_o8qw-REbwkORtYCSkwKoB_ml2iJ3imeWMVEyitejKdwKZtIOzCKNKzhqQ3lVLm03fn3PP4wUBNPHxtfvfQIkt9d_jrgj-33umihevEUkA6xORywnI_TPDwbUyE-n4RCSCPSnB7JQrF/';

rl.on('line', function (line) {
    if (!/#/.test(line) && !/https/.test(line)) {
        line = prefix + line;
    }
    line += '\r\n';
    fs.writeFileSync(__dirname + '/result.m3u8', line, {flag: 'a+'});
})