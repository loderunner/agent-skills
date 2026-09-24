package fixture

func unrelatedDefer(path string) error {
	mu.Lock()

	f, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("open file: %w", err)
	}
	defer mu.Unlock()

	return use(f)
}
