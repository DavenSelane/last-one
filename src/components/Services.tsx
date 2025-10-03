// app/components/Services.tsx
export const Services = () => {
  const services = [
    {
      icon: "fa-graduation-cap",
      title: "Skilled Instructors",
      delay: "0.1s",
      desc: "Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam",
    },
    {
      icon: "fa-globe",
      title: "Online Classes",
      delay: "0.3s",
      desc: "Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam",
    },
    {
      icon: "fa-home",
      title: "Home Projects",
      delay: "0.5s",
      desc: "Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam",
    },
    {
      icon: "fa-book-open",
      title: "Book Library",
      delay: "0.7s",
      desc: "Diam elitr kasd sed at elitr sed ipsum justo dolor sed clita amet diam",
    },
  ];

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="row g-4">
          {services.map(({ icon, title, delay, desc }, i) => (
            <div
              key={i}
              className="col-lg-3 col-sm-6 wow fadeInUp"
              data-wow-delay={delay}
            >
              <div className="service-item text-center pt-3">
                <div className="p-4">
                  <i className={`fa fa-3x ${icon} text-primary mb-4`}></i>
                  <h5 className="mb-3">{title}</h5>
                  <p>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Services;
