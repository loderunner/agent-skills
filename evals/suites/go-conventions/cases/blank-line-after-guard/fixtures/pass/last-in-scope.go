package fixture

func lastInScope() error {
	err := doSomething()
	if err != nil {
		return err
	}
}

func lastInCase(kind int) error {
	switch kind {
	case 1:
		err := doSomething()
		if err != nil {
			return err
		}
	}

	return nil
}

func lastInLoop(items []int) error {
	for range items {
		err := doSomething()
		if err != nil {
			return err
		}
	}

	return nil
}
