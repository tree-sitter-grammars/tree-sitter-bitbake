W ??= "x"
A := "${W}" # Immediate variable expansion
W ??= "y"
B := "${W}" # Immediate variable expansion
W ??= "z"
C = "${W}"
W ?= "i"

A = "x"
B = "y"
C = "i"
W = "i"

W ??= "x"
W += "y"

W ??= "x"
W:append = "y"

W = "xy"
