import spinner from '../../src/assets/rolling.gif'
export default function Spinner() {
    return (
    <div className='z-20'>
        <img src={spinner} alt='loading' className='h-20 m-auto my-3'></img>
    </div>

    );
}