package fixture

func conditions(err error, s string) bool {
	if errors.Is(err, os.ErrNotExist) {
		return true
	}

	if strings.HasPrefix(s, "widget/") {
		return true
	}

	return false
}
