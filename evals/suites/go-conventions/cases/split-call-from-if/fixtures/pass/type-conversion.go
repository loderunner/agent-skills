package fixture

func conversions(x int, b []byte) bool {
	if n := int64(x); n > 0 {
		return true
	}

	if s := string(b); s != "" {
		return true
	}

	if f := float64(x); f > 1.5 {
		return true
	}

	return false
}
