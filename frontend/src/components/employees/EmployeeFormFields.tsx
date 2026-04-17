'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

type Option = { label: string; value: string };

type Props = {
  idPrefix: string;
  departmentId: string;
  teamId: string;
  name: string;
  designation: string;
  email: string;
  password: string;
  passwordConfirm: string;
  gender: string;
  role: 'EMPLOYEE' | 'MANAGER';
  reportingManagerId: string;
  joiningDate: string;
  birthDate: string;
  departmentOptions: Option[];
  teamOptions: Option[];
  reportingManagerOptions: Option[];
  requirePassword: boolean;
  onDepartmentChange: (value: string) => void;
  onTeamChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onDesignationChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onRoleChange: (value: 'EMPLOYEE' | 'MANAGER') => void;
  onReportingManagerChange: (value: string) => void;
  onJoiningDateChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
};

export default function EmployeeFormFields(props: Props) {
  const {
    idPrefix,
    departmentId,
    teamId,
    name,
    designation,
    email,
    password,
    passwordConfirm,
    gender,
    role,
    reportingManagerId,
    joiningDate,
    birthDate,
    departmentOptions,
    teamOptions,
    reportingManagerOptions,
    requirePassword,
    onDepartmentChange,
    onTeamChange,
    onNameChange,
    onDesignationChange,
    onEmailChange,
    onPasswordChange,
    onPasswordConfirmChange,
    onGenderChange,
    onRoleChange,
    onReportingManagerChange,
    onJoiningDateChange,
    onBirthDateChange,
  } = props;

  return (
    <>
      <Select
        id={`${idPrefix}-department`}
        label='Department'
        placeholder='Select department'
        value={departmentId}
        options={departmentOptions}
        onChange={(e) => onDepartmentChange(e.target.value)}
      />
      <Select
        id={`${idPrefix}-team`}
        label='Team'
        placeholder='Select team'
        value={teamId}
        options={teamOptions}
        onChange={(e) => onTeamChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-name`}
        type='text'
        label='Full name'
        value={name}
        required
        onChange={(e) => onNameChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-designation`}
        type='text'
        label='Designation'
        value={designation}
        required
        onChange={(e) => onDesignationChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-email`}
        type='email'
        label='Work email'
        value={email}
        required
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-password`}
        type='password'
        label={requirePassword ? 'Temporary password' : 'New password (optional)'}
        value={password}
        required={requirePassword}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-password-confirm`}
        type='password'
        label={requirePassword ? 'Confirm temporary password' : 'Confirm new password'}
        value={passwordConfirm}
        required={requirePassword}
        onChange={(e) => onPasswordConfirmChange(e.target.value)}
      />
      <Select
        id={`${idPrefix}-gender`}
        label='Gender'
        placeholder='Select gender'
        value={gender}
        options={[
          { label: 'Male', value: 'MALE' },
          { label: 'Female', value: 'FEMALE' },
        ]}
        onChange={(e) => onGenderChange(e.target.value)}
      />
      <Select
        id={`${idPrefix}-role`}
        label='Role'
        placeholder='Select role'
        value={role}
        options={[
          { label: 'Employee', value: 'EMPLOYEE' },
          { label: 'Manager', value: 'MANAGER' },
        ]}
        onChange={(e) => onRoleChange(e.target.value === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE')}
      />
      <Select
        id={`${idPrefix}-reporting-manager`}
        label='Reporting manager (optional)'
        placeholder='None'
        value={reportingManagerId}
        options={reportingManagerOptions}
        onChange={(e) => onReportingManagerChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-joiningdate`}
        type='date'
        label='Joining date (DOJ)'
        value={joiningDate}
        required
        onChange={(e) => onJoiningDateChange(e.target.value)}
      />
      <Input
        id={`${idPrefix}-birthdate`}
        type='date'
        label='Date of birth (optional)'
        value={birthDate}
        onChange={(e) => onBirthDateChange(e.target.value)}
      />
    </>
  );
}
