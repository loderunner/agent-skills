package fixture

func bad() error {
	err := doSomething()
	if err != nil {
		return fmt.Errorf("do something: %w", err)
	}
	result := computeResult()
	_ = result

	return nil
}
