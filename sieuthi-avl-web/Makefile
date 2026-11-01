CXX ?= g++
CXXFLAGS ?= -std=c++11 -O2 -Wall -Wextra
TARGET := sieuthi
SRC := src/main.cpp

.PHONY: all clean
all: $(TARGET)

$(TARGET): $(SRC) $(wildcard src/*.h)
	$(CXX) $(CXXFLAGS) -Isrc $(SRC) -o $(TARGET)

clean:
	rm -f $(TARGET) $(TARGET).exe
