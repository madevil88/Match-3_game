export const Config = {
    assets: [
        { alias: 'bg', src: 'assets/Images-test/bg.png' },
        { alias: 'field', src: 'assets/Images-test/field.png' },
        { alias: 'field-selected', src: 'assets/Images-test/field-selected.png' },
        { alias: 'blue', src: 'assets/Tiles/blue.png' },
        { alias: 'green', src: 'assets/Tiles/green.png' },
        { alias: 'grey', src: 'assets/Tiles/grey.png' },
        { alias: 'orange', src: 'assets/Tiles/orange.png' },
        { alias: 'purple', src: 'assets/Tiles/purple.png' },
        { alias: 'citrus', src: 'assets/Tiles/citrus.png' }
    ],
    tilesColors: ['blue', 'green', 'grey', 'orange', 'purple', 'citrus'],
    boardParams: {
        rows: 8,
        cols: 8,
        combinationRules: [
            [
                { col: 1, row: 0 },
                { col: 2, row: 0 }
            ],
            [
                { col: 0, row: 1 },
                { col: 0, row: 2 }
            ]
        ]
    },
    winScore: 10,
    gameTime: 15
};
