export type TestDataPredicate<T> = (value: T) => boolean

const createTestDataFinderOperators = <T>() => ({
  and: (...predicates: TestDataPredicate<T>[]) => {
    return (value: T) => predicates.every((predicate) => predicate(value))
  },
  or: (...predicates: TestDataPredicate<T>[]) => {
    return (value: T) => predicates.some((predicate) => predicate(value))
  },
  not: (predicate: TestDataPredicate<T>) => {
    return (value: T) => !predicate(value)
  },
})

export type TestDataFinderOperators<T> = Readonly<ReturnType<typeof createTestDataFinderOperators<T>>>

const createTestDataExtractor = <T>(matchedValues: T[]) => {
  return {
    first: () => {
      const firstMatchedValue = matchedValues[0]

      if (typeof firstMatchedValue === 'undefined') {
        throw new Error('No test data found')
      }

      return firstMatchedValue
    },
    all: () => {
      return matchedValues
    },
  }
}

export type TestDataExtractor<T> = Readonly<ReturnType<typeof createTestDataExtractor<T>>>

export type TestDataFinder<T, H> = (
  predicateBuilder: (helpersWithOperators: H & TestDataFinderOperators<T>) => TestDataPredicate<T>,
) => TestDataExtractor<T>

export const createTestDataFinder = <T, H>(
  data: T[],
  helpersBuilder: (operators: TestDataFinderOperators<T>) => H,
): TestDataFinder<T, H> => {
  const operators = createTestDataFinderOperators<T>()

  const helpersWithOperators: H & TestDataFinderOperators<T> = {
    ...helpersBuilder(operators),
    ...operators,
  }

  return (
    predicateBuilder: (helpers: H & TestDataFinderOperators<T>) => TestDataPredicate<T>,
  ): TestDataExtractor<T> => {
    const predicate = predicateBuilder(helpersWithOperators)

    const matchedValues = data.filter(predicate)

    return createTestDataExtractor(matchedValues)
  }
}
