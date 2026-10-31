// ============================================================================
// Excel.h - Doc va xuat file Excel (.xlsx) cho QuanLyKho
// Ky thuat: ZIP, XML, CRC32, DEFLATE (LZ77 + Huffman), doc/ghi file nhi phan.
// Nguoi phu trach: Pham Minh Phuc 
// ============================================================================

#include <cctype>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <iterator>
#include <string>
#include <vector>
using namespace std;

static string xmlEsc(const string& s) {
    string r;
    for (char c : s) {
        if (c == '&') r += "&amp;";
        else if (c == '<') r += "&lt;";
        else if (c == '>') r += "&gt;";
        else if (c == '"') r += "&quot;";
        else r += c;
    }
    return r;
}
static string xmlUnesc(string s) {
    const char* tu[] = {"&lt;", "&gt;", "&quot;", "&apos;", "&amp;"};
    const char* den[] = {"<", ">", "\"", "'", "&"};
    for (int k = 0; k < 5; k++) {
        size_t p = 0;
        while ((p = s.find(tu[k], p)) != string::npos) {
            s.replace(p, strlen(tu[k]), den[k]);
            p += strlen(den[k]);
        }
    }
    return s;
}

static uint32_t crc32Of(const string& d) {
    static uint32_t bang[256];
    static bool daTao = false;
    if (!daTao) {
        for (uint32_t i = 0; i < 256; i++) {
            uint32_t c = i;
            for (int k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320u ^ (c >> 1)) : (c >> 1);
            bang[i] = c;
        }
        daTao = true;
    }
    uint32_t c = 0xFFFFFFFFu;
    for (unsigned char ch : d) c = bang[(c ^ ch) & 0xFF] ^ (c >> 8);
    return c ^ 0xFFFFFFFFu;
}
static void put16(string& s, uint32_t v) { s += (char)(v & 0xFF); s += (char)((v >> 8) & 0xFF); }
static void put32(string& s, uint32_t v) { put16(s, v & 0xFFFF); put16(s, v >> 16); }

// Ghi file zip, cac muc luu khong nen (method 0)
static bool ghiZip(const string& tenFile, const vector<pair<string, string> >& muc) {
    string out, cd;
    for (const auto& m : muc) {
        const string& ten = m.first;
        const string& dl = m.second;
        uint32_t crc = crc32Of(dl), off = (uint32_t)out.size();
        put32(out, 0x04034B50); put16(out, 20); put16(out, 0); put16(out, 0);
        put16(out, 0); put16(out, 33);
        put32(out, crc); put32(out, (uint32_t)dl.size()); put32(out, (uint32_t)dl.size());
        put16(out, (uint32_t)ten.size()); put16(out, 0);
        out += ten; out += dl;
        put32(cd, 0x02014B50); put16(cd, 20); put16(cd, 20); put16(cd, 0); put16(cd, 0);
        put16(cd, 0); put16(cd, 33);
        put32(cd, crc); put32(cd, (uint32_t)dl.size()); put32(cd, (uint32_t)dl.size());
        put16(cd, (uint32_t)ten.size()); put16(cd, 0); put16(cd, 0); put16(cd, 0); put16(cd, 0);
        put32(cd, 0); put32(cd, off);
        cd += ten;
    }
    uint32_t cdOff = (uint32_t)out.size();
    out += cd;
    put32(out, 0x06054B50); put16(out, 0); put16(out, 0);
    put16(out, (uint32_t)muc.size()); put16(out, (uint32_t)muc.size());
    put32(out, (uint32_t)cd.size()); put32(out, cdOff); put16(out, 0);
    ofstream o(tenFile, ios::binary | ios::trunc);
    if (!o) return false;
    o.write(out.data(), (streamsize)out.size());
    return (bool)o;
}

static bool ghiXlsx(const string& tenFile, const string& tenSheet, const vector<int>& rong,
                    const vector<int>& kieu, const vector<vector<string> >& dong) {
    string sh =
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">"
        "<sheetViews><sheetView workbookViewId=\"0\"><pane ySplit=\"1\" topLeftCell=\"A2\" "
        "activePane=\"bottomLeft\" state=\"frozen\"/></sheetView></sheetViews>"
        "<sheetFormatPr defaultRowHeight=\"15\"/><cols>";
    for (size_t i = 0; i < rong.size(); i++) {
        string st = kieu[i] == 1 ? " style=\"3\"" : (kieu[i] == 2 ? " style=\"2\"" : "");
        sh += "<col min=\"" + to_string(i + 1) + "\" max=\"" + to_string(i + 1) + "\" width=\"" +
              to_string(rong[i]) + "\" customWidth=\"1\"" + st + "/>";
    }
    sh += "</cols><sheetData>";
    for (size_t r = 0; r < dong.size(); r++) {
        sh += "<row r=\"" + to_string(r + 1) + "\">";
        for (size_t c = 0; c < dong[r].size(); c++) {
            const string& v = dong[r][c];
            if (v.empty()) continue;
            string ref = string(1, (char)('A' + c)) + to_string(r + 1);
            if (r == 0)
                sh += "<c r=\"" + ref + "\" s=\"1\" t=\"inlineStr\"><is><t>" + xmlEsc(v) + "</t></is></c>";
            else if (kieu[c] == 1)
                sh += "<c r=\"" + ref + "\" s=\"3\"><v>" + v + "</v></c>";
            else
                sh += "<c r=\"" + ref + "\"" + (kieu[c] == 2 ? " s=\"2\"" : "") +
                      " t=\"inlineStr\"><is><t xml:space=\"preserve\">" + xmlEsc(v) + "</t></is></c>";
        }
        sh += "</row>";
    }
    sh += "</sheetData></worksheet>";

    const string NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    const string RELNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    vector<pair<string, string> > muc;
    muc.push_back(make_pair("[Content_Types].xml",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
        "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
        "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
        "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>"
        "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
        "<Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/>"
        "</Types>"));
    muc.push_back(make_pair("_rels/.rels",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        "<Relationship Id=\"rId1\" Type=\"" + RELNS + "/officeDocument\" Target=\"xl/workbook.xml\"/>"
        "</Relationships>"));
    muc.push_back(make_pair("xl/workbook.xml",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<workbook xmlns=\"" + NS + "\" xmlns:r=\"" + RELNS + "\">"
        "<sheets><sheet name=\"" + xmlEsc(tenSheet) + "\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>"));
    muc.push_back(make_pair("xl/_rels/workbook.xml.rels",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
        "<Relationship Id=\"rId1\" Type=\"" + RELNS + "/worksheet\" Target=\"worksheets/sheet1.xml\"/>"
        "<Relationship Id=\"rId2\" Type=\"" + RELNS + "/styles\" Target=\"styles.xml\"/>"
        "</Relationships>"));
    muc.push_back(make_pair("xl/styles.xml",
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"
        "<styleSheet xmlns=\"" + NS + "\">"
        "<fonts count=\"2\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font>"
        "<font><b/><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts>"
        "<fills count=\"2\"><fill><patternFill patternType=\"none\"/></fill>"
        "<fill><patternFill patternType=\"gray125\"/></fill></fills>"
        "<borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders>"
        "<cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>"
        "<cellXfs count=\"4\">"
        "<xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/>"
        "<xf numFmtId=\"0\" fontId=\"1\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyFont=\"1\"/>"
        "<xf numFmtId=\"49\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyNumberFormat=\"1\"/>"
        "<xf numFmtId=\"3\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyNumberFormat=\"1\"/>"
        "</cellXfs>"
        "<cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles>"
        "</styleSheet>"));
    muc.push_back(make_pair("xl/worksheets/sheet1.xml", sh));
    return ghiZip(tenFile, muc);
}

// ---- Giai nen DEFLATE (de doc file da duoc Excel/WPS luu lai) ----
struct Huff { uint16_t count[16]; uint16_t symbol[288]; };
struct InfState {
    const unsigned char* in; size_t inLen, pos; uint32_t bitbuf; int bitcnt; string out; bool err;
};
static int layBit(InfState& s, int need) {
    long val = (long)s.bitbuf;
    while (s.bitcnt < need) {
        if (s.pos >= s.inLen) { s.err = true; return 0; }
        val |= (long)s.in[s.pos++] << s.bitcnt;
        s.bitcnt += 8;
    }
    s.bitbuf = (uint32_t)(val >> need);
    s.bitcnt -= need;
    return (int)(val & ((1L << need) - 1));
}
static void xayHuff(Huff& h, const unsigned char* len, int n) {
    for (int i = 0; i < 16; i++) h.count[i] = 0;
    for (int s = 0; s < n; s++) h.count[len[s]]++;
    uint16_t offs[16];
    offs[1] = 0;
    for (int l = 1; l < 15; l++) offs[l + 1] = (uint16_t)(offs[l] + h.count[l]);
    for (int s = 0; s < n; s++)
        if (len[s] != 0) h.symbol[offs[len[s]]++] = (uint16_t)s;
}
static int giaiMa(InfState& s, const Huff& h) {
    int code = 0, first = 0, index = 0;
    for (int len = 1; len <= 15; len++) {
        code |= layBit(s, 1);
        if (s.err) return -1;
        int count = h.count[len];
        if (code - count < first) return h.symbol[index + (code - first)];
        index += count; first += count; first <<= 1; code <<= 1;
    }
    return -1;
}
static bool giaiKhoi(InfState& s, const Huff& lc, const Huff& dc) {
    static const uint16_t lb[29] = {3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258};
    static const uint16_t le[29] = {0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0};
    static const uint16_t db[30] = {1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577};
    static const uint16_t de[30] = {0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13};
    while (true) {
        int sym = giaiMa(s, lc);
        if (sym < 0 || s.err) return false;
        if (sym < 256) s.out += (char)sym;
        else if (sym == 256) return true;
        else {
            sym -= 257;
            if (sym >= 29) return false;
            int len = lb[sym] + layBit(s, le[sym]);
            int ds = giaiMa(s, dc);
            if (ds < 0 || ds >= 30 || s.err) return false;
            size_t dist = (size_t)db[ds] + (size_t)layBit(s, de[ds]);
            if (s.err || dist > s.out.size()) return false;
            for (int k = 0; k < len; k++) s.out += s.out[s.out.size() - dist];
        }
    }
}
static bool inflateDl(const string& in, size_t usize, string& out) {
    InfState s;
    s.in = (const unsigned char*)in.data(); s.inLen = in.size(); s.pos = 0;
    s.bitbuf = 0; s.bitcnt = 0; s.err = false;
    s.out.reserve(usize);
    int last;
    do {
        last = layBit(s, 1);
        int type = layBit(s, 2);
        if (s.err) return false;
        if (type == 0) {
            s.bitbuf = 0; s.bitcnt = 0;
            if (s.pos + 4 > s.inLen) return false;
            unsigned len = s.in[s.pos] | (s.in[s.pos + 1] << 8);
            s.pos += 4;
            if (s.pos + len > s.inLen) return false;
            s.out.append((const char*)s.in + s.pos, len);
            s.pos += len;
        } else if (type == 1) {
            unsigned char l[320];
            int i = 0;
            for (; i < 144; i++) l[i] = 8;
            for (; i < 256; i++) l[i] = 9;
            for (; i < 280; i++) l[i] = 7;
            for (; i < 288; i++) l[i] = 8;
            Huff lc, dc;
            xayHuff(lc, l, 288);
            for (i = 0; i < 30; i++) l[i] = 5;
            xayHuff(dc, l, 30);
            if (!giaiKhoi(s, lc, dc)) return false;
        } else if (type == 2) {
            static const unsigned char thuTu[19] = {16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15};
            int nlen = layBit(s, 5) + 257, ndist = layBit(s, 5) + 1, ncode = layBit(s, 4) + 4;
            if (s.err || nlen > 286 || ndist > 30) return false;
            unsigned char l[320];
            int idx = 0;
            for (; idx < ncode; idx++) l[thuTu[idx]] = (unsigned char)layBit(s, 3);
            for (; idx < 19; idx++) l[thuTu[idx]] = 0;
            Huff cl;
            xayHuff(cl, l, 19);
            idx = 0;
            while (idx < nlen + ndist) {
                int sym = giaiMa(s, cl);
                if (sym < 0 || s.err) return false;
                if (sym < 16) l[idx++] = (unsigned char)sym;
                else {
                    int prev = 0, rep;
                    if (sym == 16) {
                        if (idx == 0) return false;
                        prev = l[idx - 1];
                        rep = 3 + layBit(s, 2);
                    } else if (sym == 17) rep = 3 + layBit(s, 3);
                    else rep = 11 + layBit(s, 7);
                    if (idx + rep > nlen + ndist) return false;
                    while (rep--) l[idx++] = (unsigned char)prev;
                }
            }
            Huff lc, dc;
            xayHuff(lc, l, nlen);
            xayHuff(dc, l + nlen, ndist);
            if (!giaiKhoi(s, lc, dc)) return false;
        } else return false;
    } while (!last);
    out = s.out;
    return true;
}

static uint32_t doc16(const string& d, size_t p) {
    return p + 2 <= d.size() ? ((unsigned char)d[p] | ((unsigned char)d[p + 1] << 8)) : 0;
}
static uint32_t doc32(const string& d, size_t p) { return doc16(d, p) | (doc16(d, p + 2) << 16); }

// Lay noi dung 1 tep ben trong zip (luu thuong hoac deflate)
static bool layTepZip(const string& zip, const string& ten, string& out) {
    if (zip.size() < 22) return false;
    size_t e = string::npos;
    for (size_t p = zip.size() - 22 + 1; p-- > 0;) {
        if (doc32(zip, p) == 0x06054B50) { e = p; break; }
        if (zip.size() - p > 65557) break;
    }
    if (e == string::npos) return false;
    uint32_t n = doc16(zip, e + 10);
    size_t q = doc32(zip, e + 16);
    for (uint32_t k = 0; k < n; k++) {
        if (doc32(zip, q) != 0x02014B50) return false;
        uint32_t method = doc16(zip, q + 10), cs = doc32(zip, q + 20), us = doc32(zip, q + 24);
        uint32_t nl = doc16(zip, q + 28), el = doc16(zip, q + 30), cl = doc16(zip, q + 32);
        size_t lho = doc32(zip, q + 42);
        string tenMuc = zip.substr(q + 46, nl);
        if (tenMuc == ten) {
            size_t dau = lho + 30 + doc16(zip, lho + 26) + doc16(zip, lho + 28);
            if (dau + cs > zip.size()) return false;
            string raw = zip.substr(dau, cs);
            if (method == 0) { out = raw; return true; }
            if (method == 8) return inflateDl(raw, us, out);
            return false;
        }
        q += 46 + nl + el + cl;
    }
    return false;
}

static string thuocTinh(const string& tag, const string& ten) {
    string kh = " " + ten + "=\"";
    size_t p = tag.find(kh);
    if (p == string::npos) return "";
    p += kh.size();
    size_t e = tag.find('"', p);
    return e == string::npos ? "" : tag.substr(p, e - p);
}
// Noi cac doan <t>...</t> trong body
static string gomChu(const string& body) {
    string r;
    size_t p = 0;
    while ((p = body.find("<t", p)) != string::npos) {
        char c = p + 2 < body.size() ? body[p + 2] : 0;
        if (c != '>' && c != ' ' && c != '/') { p += 2; continue; }
        size_t te = body.find('>', p);
        if (te == string::npos) break;
        if (body[te - 1] == '/') { p = te; continue; }
        size_t ce = body.find("</t>", te);
        if (ce == string::npos) break;
        r += body.substr(te + 1, ce - te - 1);
        p = ce + 4;
    }
    return xmlUnesc(r);
}

// Doc sheet dau tien cua file .xlsx thanh luoi chuoi (hang x cot)
// Tra ve: 1 = doc duoc, 0 = khong co file, -1 = file loi / khong doc duoc
static int docXlsx(const string& tenFile, vector<vector<string> >& luoi) {
    ifstream f(tenFile, ios::binary);
    if (!f) return 0;
    string zip((istreambuf_iterator<char>(f)), istreambuf_iterator<char>());
    string x, ss;
    if (!layTepZip(zip, "xl/worksheets/sheet1.xml", x)) return -1;
    vector<string> chung;
    if (layTepZip(zip, "xl/sharedStrings.xml", ss)) {
        size_t p = 0;
        while ((p = ss.find("<si", p)) != string::npos) {
            char c = p + 3 < ss.size() ? ss[p + 3] : 0;
            if (c != '>' && c != ' ') { p += 3; continue; }
            size_t te = ss.find('>', p), ce = ss.find("</si>", p);
            if (te == string::npos || ce == string::npos) break;
            chung.push_back(gomChu(ss.substr(te + 1, ce - te - 1)));
            p = ce + 5;
        }
    }
    luoi.clear();
    size_t pos = 0;
    while ((pos = x.find("<c", pos)) != string::npos) {
        char c2 = pos + 2 < x.size() ? x[pos + 2] : 0;
        if (c2 != ' ' && c2 != '>' && c2 != '/') { pos += 2; continue; }
        size_t te = x.find('>', pos);
        if (te == string::npos) break;
        string tag = x.substr(pos, te - pos);
        string ref = thuocTinh(tag, "r"), t = thuocTinh(tag, "t"), gt;
        size_t tiep = te + 1;
        if (tag.empty() || tag[tag.size() - 1] != '/') {
            size_t ce = x.find("</c>", te);
            if (ce == string::npos) break;
            string body = x.substr(te + 1, ce - te - 1);
            tiep = ce + 4;
            if (t == "inlineStr") gt = gomChu(body);
            else {
                size_t a = body.find("<v>"), b = body.find("</v>");
                if (a != string::npos && b != string::npos) gt = xmlUnesc(body.substr(a + 3, b - a - 3));
                if (t == "s") {
                    size_t i = (size_t)atoi(gt.c_str());
                    gt = i < chung.size() ? chung[i] : "";
                }
            }
        }
        size_t i = 0, col = 0;
        while (i < ref.size() && isalpha((unsigned char)ref[i])) { col = col * 26 + (toupper(ref[i]) - 'A' + 1); i++; }
        int hang = atoi(ref.c_str() + i);
        if (hang >= 1 && col >= 1 && hang < 100000 && col < 200) {
            if (luoi.size() < (size_t)hang) luoi.resize(hang);
            if (luoi[hang - 1].size() < col) luoi[hang - 1].resize(col);
            luoi[hang - 1][col - 1] = gt;
        }
        pos = tiep;
    }
    return 1;
}
