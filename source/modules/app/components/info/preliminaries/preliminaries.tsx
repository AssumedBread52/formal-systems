import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Preliminaries = (): ReactElement => {
  return (
    <section>
      <h3>
        Preliminaries
      </h3>
      <p>
        The set of all natural numbers, or non-negative integers, are the positive whole numbers including zero.
        <RenderMath content='\omega=\mathbb{N}=\mathbb{Z}^+=\{0,1,2,\dots\}' />
        Each natural number can be defined as a set containing all natural numbers less than itself.
        <RenderMath content='\forall n\in\omega(n=\{m\in\omega::m\lt n\})' />
        We can group functions with the same domain that are surjective to a codomain into a set.
        <RenderMath content='^BA=\{f::\exists C\subseteq A(f:B\to C)\}' />
        Using natural numbers as sets, simple finite sequences can be thought of as surjective functions with a domain of their
        length and codomain of any set which contains the symbols appearing in the sequence. Infinite sequences are similar
        except their domain is the set of natural numbers rather than any individual natural number. Each term in the sequence
        can be referenced by its zero-based index. Angle brackets wrap terms to show sequences.
        <RenderMath content='\forall n\in\omega(f\in{^n}A\to(\vert f\vert=n\land f=\langle f_0,f_1,\dots,f_n\rangle))' />
        <RenderMath content='f\in{^\omega}A\to f=\langle f_0,f_1,\dots\rangle' />
        Two finite sequences can be concatenated into a single finite sequence.
        <RenderMath content='h=f\frown g' />
        The length of the concatenated sequence is the sum of the length of the operands.
        <RenderMath content='\vert h\vert=\vert f\vert+\vert g\vert' />
        The order of terms are determined by the order of the operands.
        <RenderMath content='h_n=\begin{cases}f_n&0\le n\lt\vert f\vert\\g_{n-\vert f\vert}&\vert f\vert\le n\lt\vert f\vert+\vert g\vert\end{cases}' />
      </p>
    </section>
  );
};
