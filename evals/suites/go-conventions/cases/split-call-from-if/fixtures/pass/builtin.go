package fixture

func builtins(xs []int, m map[string]int) bool {
	if n := len(xs); n > 0 {
		return true
	}

	if c := cap(xs); c > 4 {
		return true
	}

	return false
}
