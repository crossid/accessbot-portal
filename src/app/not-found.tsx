'use client';

export default function NotFound() {
  return (
    <>
      <title>404: Not found.</title>
      <div className="flex h-screen flex-col items-center justify-center text-center font-sans">
        <div>
          <h1 className="next-error-h1 mr-5 inline-block border-r pr-6 text-3xl font-medium leading-none">
            Error
          </h1>
          <div className="inline-block">
            <h2 className="m-0 text-base font-normal leading-none">
              Not found
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}
