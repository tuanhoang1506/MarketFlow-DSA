#pragma once
#include <cstdio>
#include <ctime>
#include <string>
using namespace std;

struct Date {
    int d = 1, m = 1, y = 2000;

    long key() const { return y * 10000L + m * 100 + d; }
    string str() const {
        char buf[16];
        snprintf(buf, sizeof(buf), "%02d/%02d/%04d", d, m, y);
        return buf;
    }
    static Date homNay() {
        time_t t = time(nullptr);
        tm* lt = localtime(&t);
        Date r;
        r.d = lt->tm_mday;
        r.m = lt->tm_mon + 1;
        r.y = lt->tm_year + 1900;
        return r;
    }
    static bool hopLe(int d, int m, int y) {
        if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1) return false;
        int ngay[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
        bool nhuan = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);
        int toiDa = ngay[m - 1] + ((m == 2 && nhuan) ? 1 : 0);
        return d <= toiDa;
    }
};
