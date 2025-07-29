from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import date

app = Flask(__name__)

# Configure database URI
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:@password:6000/mydatabase"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ------------ MODELS ------------

class Teacher(db.Model):
    __tablename__ = 'teachers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)

class Class(db.Model):
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)

class ClassStudent(db.Model):
    __tablename__ = 'class_students'
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), primary_key=True)

class ClassTeacher(db.Model):
    __tablename__ = 'class_teachers'
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), primary_key=True)

class ClassWeek(db.Model):
    __tablename__ = 'class_weeks'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'))
    week_number = db.Column(db.Integer, nullable=False)
    goals = db.Column(db.JSON, nullable=False)

class Evaluation(db.Model):
    __tablename__ = 'evaluations'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'))
    date = db.Column(db.Date, default=date.today)
    evaluation_data = db.Column(db.JSON, nullable=False)

# ------------ ROUTES ------------

@app.route('/add_class', methods=['POST'])
def add_class():
    data = request.json
    new_class = Class(name=data['name'])
    db.session.add(new_class)
    db.session.commit()
    return jsonify({"status": "Class added", "class_id": new_class.id})

@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    data = request.json
    new_teacher = Teacher(name=data['name'])
    db.session.add(new_teacher)
    db.session.commit()
    return jsonify({"status": "Teacher added", "teacher_id": new_teacher.id})

@app.route('/add_student', methods=['POST'])
def add_student():
    data = request.json
    new_student = Student(name=data['name'])
    db.session.add(new_student)
    db.session.commit()
    return jsonify({"status": "Student added", "student_id": new_student.id})

@app.route('/assign_teacher', methods=['POST'])
def assign_teacher():
    data = request.json
    link = ClassTeacher(class_id=data['class_id'], teacher_id=data['teacher_id'])
    db.session.add(link)
    db.session.commit()
    return jsonify({"status": "Teacher assigned"})

@app.route('/assign_student', methods=['POST'])
def assign_student():
    data = request.json
    link = ClassStudent(class_id=data['class_id'], student_id=data['student_id'])
    db.session.add(link)
    db.session.commit()
    return jsonify({"status": "Student assigned"})

@app.route('/add_weekly_goals', methods=['POST'])
def add_weekly_goals():
    data = request.json
    week = ClassWeek(
        class_id=data['class_id'],
        week_number=data['week_number'],
        goals=data['goals']  # Should be JSON
    )
    db.session.add(week)
    db.session.commit()
    return jsonify({"status": "Weekly goals added", "week_id": week.id})

@app.route('/add_evaluation', methods=['POST'])
def add_evaluation():
    data = request.json
    eval = Evaluation(
        student_id=data['student_id'],
        evaluation_data=data['evaluation_data']
    )
    db.session.add(eval)
    db.session.commit()
    return jsonify({"status": "Evaluation added", "evaluation_id": eval.id})

# ------------ MAIN ------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True)
