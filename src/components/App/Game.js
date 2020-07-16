import React, { Component } from 'react'

export default class Timer extends Component {
    
    state = {
        hours: 1,
        minutes: 0,
        seconds: 0,
    }

    componentDidMount() {

        const userAction = async () => {
            const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/London');
            const myJson = await response.json();
            const formattedTime = myJson.utc_datetime.slice(11, 19);
            const h = parseInt(formattedTime.slice(0,2));
            const m = parseInt(formattedTime.slice(3,5));
            const s = parseInt(formattedTime.slice(6,8));
            const nowInSec = (h * 3600) + (m * 60) + (s);
            const matchEndTimeInSec = (nowInSec > 79200) ? (36000) : (79200);
            const difference = (matchEndTimeInSec - nowInSec);
            const hours   = Math.floor((difference / (60 * 60)) % 24);
            const minutes = Math.floor((difference / 60) % 60);
            const seconds = Math.floor((difference) % 60);
            this.setState({
                hours:hours,
                minutes:minutes,
                seconds:seconds
            });
        }
        userAction();

        this.myInterval = setInterval(() => {
            const { seconds, minutes, hours } = this.state

            if (seconds > 0) {
                this.setState(({ seconds }) => ({
                    seconds: seconds - 1
                }))
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    if(hours === 0) {
                        userAction();
                        // clearInterval(this.myInterval);
                    }
                    else {
                        this.setState(({ hours }) => ({
                            hours: hours - 1,
                            minutes: 59
                        }))
                    }
                } else {
                    this.setState(({ minutes }) => ({
                        minutes: minutes - 1,
                        seconds: 59
                    }))
                }
            } 
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.myInterval)
    }

    render() {
        const { hours, minutes, seconds } = this.state
        return (
            <section id="about" className="services-area pt-120">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                        <div className="section-title text-center pb-40">
                            <div className="line m-auto" />
                            <h3 className="title"><span>GAME COUNTDOWN TIME</span></h3>
                        </div> 
                        </div>
                    </div> 
                    <div className="row justify-content-center">
                        <div className="col-lg-4 col-md-7 col-sm-8">
                        <div className="text-center mt-30 wow fadeIn" data-wow-duration="1s" data-wow-delay="0.2s">
                            <div className="about-content mt-30">
                                <h1>{hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}</h1>
                            </div>
                        </div> 
                        </div>
                    </div> 
                </div> 
            </section>

        )
    }
}
