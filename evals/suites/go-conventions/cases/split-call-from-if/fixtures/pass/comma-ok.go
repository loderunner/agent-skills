package fixture

func commaOK(m map[string]int, k string) int {
	if v, ok := m[k]; ok {
		return v
	}

	return 0
}

func typeAssert(x any) string {
	if s, ok := x.(string); ok {
		return s
	}

	return ""
}
