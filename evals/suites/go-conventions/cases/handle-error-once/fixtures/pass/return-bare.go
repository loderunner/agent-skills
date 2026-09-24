package fixture

func passthrough() error {
	err := doSomething()
	if err != nil {
		return err
	}

	return nil
}
