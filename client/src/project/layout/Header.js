export function Header() {
    return (
        <div className="shadow-md p-6 border-solid border-b-2 border-coffee_5 bg-white text-center w-full fixed top-0 left-0 z-10">
            <h1 className="my-2 bg-white text-3xl italic font-semibold text-coffee_5">Charity Donation</h1>
            <ul className="p-6 flex text-coffee_5 justify-center gap-6 w-full text-left">
                <li><a className="p-2 border-b-2 border-white hover:border-coffee_5 font-semibold" href="/">All Projects</a></li>
                <li><a className="p-2 border-b-2 border-white hover:border-coffee_5 font-semibold" href="/new">New Project</a></li>
                <li><a className="p-2 border-b-2 border-white hover:border-coffee_5 font-semibold" href="/about">About</a></li>
                <li><a className="p-2 border-b-2 border-white hover:border-coffee_5 font-semibold" href="/donations">My Donations</a></li>
                <li><a className="p-2 border-b-2 border-white hover:border-coffee_5 font-semibold" href="/charity">My Charity</a></li>
            </ul>
        </div>
    );
};