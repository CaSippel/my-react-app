import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
      <button
        className={'square ' + props.style}
        onClick={() => props.onClick()}
      >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        style={this.props.winners.includes(i) ? 'winner' : ''}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const max_index = 3;
    let rows = [];
    for (let i = 0; i < max_index; i++) {
      let cols = [];
      for (let j = 0; j < max_index; j++) {
        cols.push(this.renderSquare(i * max_index + j));
      }
      rows.push(<div key={'row' + i} className="board-row">{cols}</div>);
    }
    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }
  
  handleClick(i) {
    // changing the history here will allow us to jump to multiple steps,
    // and a step is only committed to once we click a new square
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).length || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    // note: concat won't mutate the original array
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winners = calculateWinner(current.squares);
    
    const moves = history.map((step, move) => {
      let desc: String;
      if (move) {
        // find the index that's different between curr move and last
        const lastHistory = history[move - 1].squares;
        const thisHistory = history[move].squares;
        for (var i = 0; i < thisHistory.length; i++) {
          if (thisHistory[i] !== lastHistory[i]) {
            break;
          }
        }
        const row = Math.floor(i / 3) + 1;
        const col = (i % 3) + 1;
        desc = 'Go to move #' + move + ' at (' + col + ', ' + row + ')';
      } else {
        desc = 'Go to game start';
      }
      
      return (
        <li key={move}>
          <button
            className={(move === this.state.stepNumber) ? 'bolded' : ''}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });
    
    let status;
    if (winners.length) {
      status = 'Winner: ' + current.squares[winners[0]];
    } else if (moves.length > current.squares.length) {
      status = 'Draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winners={winners}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// ========================================

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i=0; i<lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return [a, b, c];
    }
  }
  return [];
}
