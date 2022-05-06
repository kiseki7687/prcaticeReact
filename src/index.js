import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        let className = 'square';
        if (
            this.props.line !== null
            && this.props.line.indexOf(i) !== -1
        ) {
            className += ' highlight-color';
        }
        return (
            <Square
                className={className}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                key={i}
            />
        );
    }
    createBoardHtml() {    // 追加
        let square, div = [];
        let num = 0;
        for (let i = 0; i < 3; i++) {
            square = [];
            for (let j = 0; j < 3; j++) {
                num = 3 * i + j;
                square.push(this.renderSquare(num));
            }
            div.push(<div className="board-row" key={i}>{square}</div>);
        }
        return div;
    }
    render() {
        return (
            <div>
                {this.createBoardHtml()/*修正*/}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null)
                }
            ],
            order: 'asc',
            stepNumber: 0,
            xIsNext: true,
            clickPosition: {    //追加
                col: null,
                row: null
            }
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        const position = getPosition(i);    // 追加
        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            clickPosition: position    // 追加
        });
    }
    handleChange() {
        const order = this.state.order === 'asc' ? 'desc' : 'asc';
        this.setState({
            order: order
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const win = calculateWinner(current.squares);
        const winner = win.winner;
        const line = win.line;
        let moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            const className = move === this.state.stepNumber ? 'active' : '' ;    // 追加
            return (    // className追加
                <li key={move} className={className}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            if (this.state.stepNumber === 9) // 追加
                status = 'Result:draw';
            else
                status = 'Next player:' + (this.state.xIsNext ? 'X' : 'O');
        }
        if (this.state.order === 'desc') {  // 追加
            moves = moves.reverse();
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        line={line}
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <Toggle
                        order={this.state.order}
                        onChange={() => this.handleChange()}
                    />
                    <div>col:{this.state.clickPosition.col}, row:{this.state.clickPosition.row}</div>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

class Toggle extends React.Component {
    render() {
        return (
            <div className="toggle">
                <span>History order:&nbsp;</span>
                <input type="radio" name="order" id="asc" value="asc" checked={this.props.order === 'asc'}
                       onChange={() => this.props.onChange()}/>
                <label htmlFor="asc" className="switch-on">ASC</label>
                <input type="radio" name="order" id="desc" value="desc" checked={this.props.order === 'desc'}
                       onChange={() => this.props.onChange()}/>
                <label htmlFor="desc" className="switch-off">DESC</label>
            </div>
        )
    }
}
// ========================================

ReactDOM.render(<Game/>, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { // 修正
                'winner': squares[a],
                'line': lines[i]    // winner's line
            };
        }
    }
    return { // 修正
        'winner': null,
        'line': null
    };
}
function getPosition(index) {
    let pos = [];
    for (let row = 1; row <= 3; row++) {
        for (let col = 1; col <= 3; col++) {
            pos.push({
                row: row,
                col: col
            });
        }
    }
    return pos[index];
}
