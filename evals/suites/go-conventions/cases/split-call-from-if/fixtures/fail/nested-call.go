package fixture

func nested() bool {
	if n := len(mustList()); n > 0 {
		return true
	}

	return false
}
