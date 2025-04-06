import { Outlet, Link } from "react-router";

const Layout = () => {
  return (
    <>
      <div style={{textAlign: "left", width: "100%"}}>
        <nav>
            <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/submit-report">Submit a Report</Link>
            </li>
            <li>
                <Link to="/about">About</Link>
            </li>
            <li>
                <Link to="/donate">Donate</Link>
            </li>
            </ul>
        </nav>

        <Outlet />
      </div>
    </>
  )
};

export default Layout;