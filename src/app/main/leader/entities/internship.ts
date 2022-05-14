import {Guid} from 'core';

export class Internship {
  public internship_id_rcd?: string;
  public internship_name?: string;
  public academic_year?: string;
  public semester?: number;
  public active_flag?: number;
  public start_date?: Date;
  public number_of_weeks?: number;
  public created_by_user_id?: string;
  public created_date_time?: Date;
  public lu_updated?: Date;
  public lu_user_id?: string;
}
export class InternShipClass {
  public rowNumber: number;
  public internship_class_id: Guid;
  public class_id_rcd: string;
  public class_name: string;
  public major_name: string;
  public specialization_name: string;
  public internship_id_rcd: string;
  public internship_name: string;
  public academic_year: string;
  public semester: number;
  public start_date: Date;
  public number_of_weeks: number;
}
export class InternshipClassModel {
  public internship_class_id: Guid;
  public class_id_rcd: string;
  public internship_id_rcd: string;
  public active_flag?: boolean;
  public created_by_user_id?: string;
  public created_date_time?: Date;
  public lu_updated?: Date;
  public lu_user_id?: string;
}
