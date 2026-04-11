export default function EmployeesNoAccess() {
  return (
    <section className='rounded-3xl border border-gray-100 bg-white p-6 shadow-sm'>
      <h1 className='font-bold text-gray-900 text-xl'>Employees</h1>
      <p className='mt-2 text-gray-600 text-sm'>
        You do not have permission to view the employee directory.
      </p>
    </section>
  );
}
