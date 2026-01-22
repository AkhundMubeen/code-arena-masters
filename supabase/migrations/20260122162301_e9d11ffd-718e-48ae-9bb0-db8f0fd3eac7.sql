-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create difficulty enum
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard', 'beast');

-- Create competition status enum
CREATE TYPE public.competition_status AS ENUM ('upcoming', 'live', 'ended');

-- Create submission status enum
CREATE TYPE public.submission_status AS ENUM ('pass', 'fail');

-- Create manual status enum
CREATE TYPE public.manual_status AS ENUM ('pending', 'overridden');

-- Create participant status enum
CREATE TYPE public.participant_status AS ENUM ('active', 'banned', 'kicked');

-- Create language enum
CREATE TYPE public.programming_language AS ENUM ('python', 'java', 'cpp');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT NOT NULL,
    department TEXT,
    xp INTEGER NOT NULL DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Competitions table
CREATE TABLE public.competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status competition_status NOT NULL DEFAULT 'upcoming',
    access_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty difficulty_level NOT NULL DEFAULT 'easy',
    default_code_python TEXT DEFAULT '# Write your Python code here\n',
    default_code_java TEXT DEFAULT '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
    default_code_cpp TEXT DEFAULT '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
    hidden_input TEXT NOT NULL DEFAULT '',
    expected_output TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Participants table
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status participant_status NOT NULL DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (competition_id, user_id)
);

-- Submissions table
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    language programming_language NOT NULL,
    code TEXT NOT NULL,
    auto_status submission_status,
    manual_status manual_status NOT NULL DEFAULT 'pending',
    execution_time_ms INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for competitions
CREATE POLICY "Anyone can view competitions"
ON public.competitions FOR SELECT
USING (true);

CREATE POLICY "Admins can create competitions"
ON public.competitions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Hosts can update their competitions"
ON public.competitions FOR UPDATE
USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Hosts can delete their competitions"
ON public.competitions FOR DELETE
USING (auth.uid() = host_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for questions
CREATE POLICY "Authenticated users can view questions"
ON public.questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage questions"
ON public.questions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for participants
CREATE POLICY "Anyone can view participants"
ON public.participants FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join competitions"
ON public.participants FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage participants"
ON public.participants FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can remove participants"
ON public.participants FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for submissions
CREATE POLICY "Users can view their own submissions"
ON public.submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
ON public.submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create submissions"
ON public.submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update submissions"
ON public.submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::text, 8)));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
    
    RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at
BEFORE UPDATE ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competitions;

-- Create indexes for performance
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_competition_id ON public.submissions(competition_id);
CREATE INDEX idx_submissions_question_id ON public.submissions(question_id);
CREATE INDEX idx_participants_competition_id ON public.participants(competition_id);
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_questions_competition_id ON public.questions(competition_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_access_code ON public.competitions(access_code);