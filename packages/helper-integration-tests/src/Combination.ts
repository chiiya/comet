export default class Combination {

  /**
   * Get all possible combinations of `k` elements in a set.
   *
   * Examples:
   *  Combination.kCombinations([1, 2, 3], 2)
   *   -> [[1,2], [1,3], [2, 3]
   *
   * @param set
   * @param k
   */
  public static kCombinations(set: any[], k: number): any[] {
    if (k > set.length || k <= 0) {
      return [];
    }

    if (k === set.length) {
      return [set];
    }

    if (k === 1) {
      return set.reduce((acc, cur) => [...acc, [cur]], []);
    }

    const combinations = [];
    let tailCombinations = [];

    for (let i = 0; i <= set.length - k + 1; i += 1) {
      tailCombinations = Combination.kCombinations(set.slice(i + 1), k - 1);
      for (let j = 0; j < tailCombinations.length; j += 1) {
        combinations.push([set[i], ...tailCombinations[j]]);
      }
    }

    return combinations;
  }

  /**
   * Get all possible combinations of elements in a set.
   *
   * Examples:
   *   Combination.combinations([1, 2, 3])
   *   -> [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
   *
   * @param set
   */
  public static combinations(set: any[]): any[] {
    return set.reduce((acc, cur, idx) => [...acc, ...Combination.kCombinations(set, idx + 1)], []);
  }
}
