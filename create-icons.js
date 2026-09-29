const fs = require('fs');

function crc32(buf) {
    const table = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[i] = c >>> 0;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = (table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crcBuf]);
}

function adler32(data) {
    let s1 = 1, s2 = 0;
    for (let i = 0; i < data.length; i++) {
        s1 = (s1 + data[i]) % 65521;
        s2 = (s2 + s1) % 65521;
    }
    return ((s2 << 16) | s1) >>> 0;
}

function deflateStore(data) {
    // Non-compressed deflate (BFINAL=1, BTYPE=00)
    const blocks = [];
    let offset = 0;
    while (offset < data.length) {
        const size = Math.min(65535, data.length - offset);
        const last = (offset + size >= data.length) ? 1 : 0;
        const hdr = Buffer.alloc(5);
        hdr[0] = last;
        hdr.writeUInt16LE(size, 1);
        hdr.writeUInt16LE((~size) & 0xFFFF, 3);
        blocks.push(hdr);
        blocks.push(data.slice(offset, offset + size));
        offset += size;
    }
    const adler = Buffer.alloc(4);
    adler.writeUInt32BE(adler32(data), 0);
    return Buffer.concat([Buffer.from([0x78, 0x01]), ...blocks, adler]);
}

function createPNG(width, height, r, g, b, outPath) {
    // Build raw scanlines (filter=0, RGB)
    const rowBufs = [];
    for (let y = 0; y < height; y++) {
        const row = Buffer.alloc(1 + width * 3);
        row[0] = 0;
        for (let x = 0; x < width; x++) {
            row[1 + x * 3 + 0] = r;
            row[1 + x * 3 + 1] = g;
            row[1 + x * 3 + 2] = b;
        }
        rowBufs.push(row);
    }
    const raw = Buffer.concat(rowBufs);
    const compressed = deflateStore(raw);

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 2;   // color type: RGB
    ihdr[10] = 0;  // compression
    ihdr[11] = 0;  // filter
    ihdr[12] = 0;  // interlace

    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const png = Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0))
    ]);

    fs.writeFileSync(outPath, png);
    console.log(`✅ Created: ${outPath} (${width}x${height})`);
}

const base = 'c:\\Strange Alarm Mobile App\\assets\\images\\';

// Purple theme #7C5CFC = 124, 92, 252
createPNG(1024, 1024, 124, 92, 252, base + 'icon.png');
createPNG(1024, 1024, 124, 92, 252, base + 'adaptive-icon.png');
createPNG(1284, 2778, 8,   8,  24,  base + 'splash.png');
createPNG(32,   32,   124, 92, 252, base + 'favicon.png');
createPNG(96,   96,   255, 255, 255, base + 'notification-icon.png');

console.log('\n🎉 All icons created successfully!');
