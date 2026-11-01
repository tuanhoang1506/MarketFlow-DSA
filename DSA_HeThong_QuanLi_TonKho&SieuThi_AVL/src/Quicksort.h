#pragma once
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#include "Date.h"
#include "Utils.h"
using namespace std;

// ---- TonKho: mot lo hang cua mat hang ----
class TonKho {
private:
    string maLoHang;
    int soLuongTon;
    Date hanSuDung;
    string viTriKho;

public:
    TonKho() : soLuongTon(0) {}
    TonKho(const string& ma, int sl, const Date& hsd, const string& viTri)
        : maLoHang(ma), soLuongTon(sl), hanSuDung(hsd), viTriKho(viTri) {}

    // ---- getter ----
    const string& getMaLoHang() const { return maLoHang; }
    int getSoLuongTon() const { return soLuongTon; }
    const Date& getHanSuDung() const { return hanSuDung; }
    const string& getViTriKho() const { return viTriKho; }

    // ---- setter ----
    void setHanSuDung(const Date& d) { hanSuDung = d; }
    void setViTriKho(const string& v) { viTriKho = v; }

    // true neu lo hang con han su dung
    bool kiemTraHanSD() const { return hanSuDung.key() >= Date::homNay().key(); }
    // qty > 0: nhap them, qty < 0: xuat bot
    bool capNhatSoLuong(int qty) {
        if (soLuongTon + qty < 0) return false;
        soLuongTon += qty;
        return true;
    }
};
