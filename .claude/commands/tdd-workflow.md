# /tdd-workflow — TDD実装フロー

## 用途
テスト駆動開発（TDD）でMYKENKOの機能を実装する。

## Red-Green-Refactorサイクル

### 1. Red（テストを書く）
```php
// Laravel: まずテストを書く
public function test_商品が正常に作成される(): void
{
    $response = $this->postJson('/api/products', [
        'name' => 'テスト商品',
        'price' => 1000,
    ]);

    $response->assertStatus(201)
             ->assertJsonStructure(['id', 'name', 'price']);
}
```

### 2. Green（最小限の実装）
テストを通す最小限のコードだけを書く。過剰実装しない。

### 3. Refactor（改善）
テストが通った状態を維持しながらコードの品質を改善する。

## 実装チェックリスト
- [ ] テストを先に書いたか
- [ ] テストが失敗することを確認したか（Red）
- [ ] 最小限の実装でテストが通ったか（Green）
- [ ] リファクタリング後もテストが通るか（Refactor）
- [ ] エッジケース（空・null・境界値）のテストがあるか

## テスト命名規則
```
[対象]が[条件]の場合[期待する動作]
例: 在庫が0の場合注文が失敗する
```
