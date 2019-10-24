import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container, Button, Col, Row } from 'react-bootstrap';
import FacebookLogin from 'react-facebook-login'
import GoogleLogin from 'react-google-login';

function App() {
  const [board, setBoard] = useState(new Array(9).fill(null))
  const [isOver, setIsOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [topScores, setTopScores] = useState([])

  useEffect(() => {
    localStorage.getItem(currentUser)
    getHighScoreTable()
  }, [currentUser])

  const resetGame = () => {
    setBoard(new Array(9).fill(null))
    setWinner(null)
    setIsOver(false)
  }

  const resetUser = () => {
    setCurrentUser(null)
    setBoard(new Array(9).fill(null))
    setWinner(null)
    setIsOver(false)
  }

  const responseFromFB = (resp) => {
    console.log('facebook user data', resp)
    setCurrentUser({
      name: resp.name,
      email: resp.email,
      picture: resp.picture.data.url
    })
    localStorage.setItem("currentUser", JSON.stringify({
      name: resp.name,
      email: resp.email,
      picture: resp.picture.data.url
    }))
  }

  const responseGoogle = (response) => {
    console.log(currentUser)
    setCurrentUser({
      name: response.profileObj.name,
      email: response.profileObj.email,
      picture: response.profileObj.imageUrl

    })
    localStorage.setItem("currentUser", JSON.stringify({
      name: response.name,
      email: response.email,
    }))
    console.log(currentUser) ;
  }

  const getHighScoreTable = async () => {
    const url = `https://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    const data = await response.json()
    console.log("api data", data)
    setTopScores(data.items)
  }

  const postScore = async () => {
    let data = new URLSearchParams();
    data.append("player", currentUser.name);
    data.append("score", -1);
    const url = `https://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data.toString(),
      json: true
    })
    const resp = await response.json()
    getHighScoreTable()
  }

  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand href="#home">TicTacToe</Navbar.Brand>
      </Navbar>
      
      {!currentUser ?
        <>
          <div className="sign-in my-auto">
            <div className="facebook-login">
              <FacebookLogin
                autoLoad={false}
                appId="2590024587942698"
                fields="name,email,picture"
                callback={(resp) => responseFromFB(resp)}
              />
            </div>
            <div className="google-login">
              <GoogleLogin className="align-items-center"
                clientId="221134323663-crugh08ftlhi5s659en9m6tkrc8bjl8t.apps.googleusercontent.com" //CLIENTID NOT CREATED YET
                buttonText="LOGIN WITH GOOGLE"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
              />
            </div>
          </div>
        </>
        :
        <>
          <Container>
            <Row>
              <Col xs={12} xsOffset={6} className="justify-content-center align-items-center d-flex" >
                <div className="display-box my-auto">
                  <img src={currentUser.picture} alt={currentUser.name} />
                  <h2> Hello {currentUser.name}</h2>
                </div>
              </Col>
            </Row>
            
            <Row >
              <Col  lg={true} className="gameinfo justify-content-center align-items-center d-flex">
                <h3>Game Info</h3>
                {isOver ? <span>{winner ? <span>The game is over and the winner was {winner} </span>
                  : <span> Game is over and its a draw</span>} </span>
                  : <span> Next Player is {board.filter(el => !el).length % 2 ? 'X' : 'O'}</span>}
              </Col>
              <Col  lg={true} className="justify-content-center align-items-center d-flex ">
                <Board
                  board={board}
                  setBoard={setBoard}
                  isOver={isOver}
                  setIsOver={setIsOver}
                  setWinner={setWinner}
                />
              </Col>
              <Col  lg={true} className="topscores justify-content-center align-items-center d-flex">
                <h3>Top Scores</h3>
                <Col >
                  {topScores.map(el => <li>{el.player} with a score of {el.score}</li>)}
                </Col>
              </Col>
            </Row>
            <Row>
              <Col lg={true} >
                <Button className="Button" variant="outline-danger" onClick={postScore}> Save Score </Button>
                <Button className="Button" variant="outline-danger" onClick={resetGame}> Reset Game </Button>
                <Button className="Button" variant="outline-danger" onClick={resetUser}> LogOut </Button>
              </Col>
            </Row>

          </Container>
        </>
      }
    </div>
  );
}


function Square(props) {
  return <div className="square" onClick={() => props.handleClick(props.id)}>
    {props.value}
  </div>
}

function Board(props) {
  const handleClick = (id) => {
    if (props.isOver) return

    let board = props.board.slice(0)
    const check = board.filter(el => el === null)
    const squareTaken = board[id]

    if (squareTaken) {
      console.log('returning early ed, this square is taken')
      console.log('what the board looks like now', board)
      console.log('this was in the square u clicked', board[id])
      return

    }
    board[id] = check.length % 2 ? "X" : "O"

    const isDraw = board.filter(el => !el).length === 0
    if (isDraw) {
      props.setIsOver(true)
    }
    if (decideOutcome(board)) {
      props.setWinner(decideOutcome(board))
      props.setIsOver(true)
    }
    props.setBoard(board)
  }
  return <div className="board" >
    {props.board.map((el, idx) => {
      return <Square
        key={idx}
        id={idx}
        value={el}
        handleClick={handleClick}
      />
    })}
  </div>
}

const decideOutcome = (board) => {
  const winningOptions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
  ]
  for (var i = 0; i < winningOptions.length; i++) {
    var [a, b, c] = winningOptions[i]
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a]
  }
  return
}

export default App;
