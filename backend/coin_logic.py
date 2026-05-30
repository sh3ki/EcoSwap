def calculate_coins(bottles: int, cans: int) -> int:
    """
    Coin exchange rules:
      5 water bottles  = ₱1 coin
      2 aluminum cans  = ₱1 coin
    """
    return (bottles // 5) + (cans // 2)


def calculate_leftover(bottles: int, cans: int) -> dict:
    return {
        "leftover_bottles": bottles % 5,
        "leftover_cans": cans % 2,
    }
