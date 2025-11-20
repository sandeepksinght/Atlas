import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionCard from './QuestionCard';
import { Question } from '../types';

interface DraggableQuestionListProps {
  questions: Question[];
  assessmentType: string;
  onUpdate: (questionId: string, data: any) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (question: Question) => void;
  onReorder: (questions: Question[]) => void;
}

export const DraggableQuestionList: React.FC<DraggableQuestionListProps> = ({
  questions,
  assessmentType,
  onUpdate,
  onDelete,
  onDuplicate,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      onReorder(newQuestions);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <SortableQuestionCard
              key={question.id}
              question={question}
              index={index}
              assessmentType={assessmentType}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

// Sortable Question Card Wrapper
interface SortableQuestionCardProps {
  question: Question;
  index: number;
  assessmentType: string;
  onUpdate: (questionId: string, data: any) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (question: Question) => void;
}

const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  question,
  index,
  assessmentType,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
      >
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <QuestionCard
        question={question}
        index={index}
        assessmentType={assessmentType}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onMoveUp={undefined} // Drag & drop replaces up/down buttons
        onMoveDown={undefined}
      />
    </div>
  );
};
